import type {CookieParseOptions, CookieSerializeOptions} from "cookie";
import {parse, serialize} from "cookie";

export type SignFunction = (value: string, secret: string) => Promise<string> | string;

export type UnsignFunction = (
    cookie: string,
    secret: string
) => Promise<string | false> | string | false;

export type {CookieParseOptions, CookieSerializeOptions};

export interface CookieSignatureOptions {
    /**
     * An array of secrets that may be used to sign/unsign the value of a cookie.
     *
     * The array makes it easy to rotate secrets. New secrets should be added to
     * the beginning of the array. `cookie.serialize()` will always use the first
     * value in the array, but `cookie.parse()` may use any of them so that
     * cookies that were signed with older secrets still work.
     */
    secrets?: string[];
}

export type CookieOptions = CookieParseOptions &
    CookieSerializeOptions &
    CookieSignatureOptions;

/**
 * A HTTP cookie.
 *
 * A Cookie is a logical container for metadata about a HTTP cookie; its name
 * and options. But it doesn't contain a value. Instead, it has `parse()` and
 * `serialize()` methods that allow a single instance to be reused for
 * parsing/encoding multiple different values.
 *
 * @see https://remix.run/utils/cookies#cookie-api
 */
export interface Cookie {
    /**
     * The name of the cookie, used in the `Cookie` and `Set-Cookie` headers.
     */
    readonly name: string;

    /**
     * True if this cookie uses one or more secrets for verification.
     */
    readonly isSigned: boolean;

    /**
     * The Date this cookie expires.
     *
     * Note: This is calculated at access time using `maxAge` when no `expires`
     * option is provided to `createCookie()`.
     */
    readonly expires?: Date;

    /**
     * Parses a raw `Cookie` header and returns the value of this cookie or
     * `null` if it's not present.
     */
    parse(
        cookieHeader: string | null,
        options?: CookieParseOptions
    ): Promise<any>;

    /**
     * Serializes the given value to a string and returns the `Set-Cookie`
     * header.
     */
    serialize(value: any, options?: CookieSerializeOptions): Promise<string>;
}

export type CreateCookieFunction = (
    name: string,
    cookieOptions?: CookieOptions
) => Cookie;

/**
 * Creates a logical container for managing a browser cookie from the server.
 *
 * @see https://remix.run/utils/cookies#createcookie
 */
export const createCookieFactory =
    ({
         sign,
         unsign,
     }: {
        sign: SignFunction;
        unsign: UnsignFunction;
    }): CreateCookieFunction =>
        (name, cookieOptions = {}) => {
            let {secrets = [], ...options} = {
                path: "/",
                sameSite: "lax" as const,
                ...cookieOptions,
            };

            return {
                get name() {
                    return name;
                },
                get isSigned() {
                    return secrets.length > 0;
                },
                get expires() {
                    // Max-Age takes precedence over Expires
                    return typeof options.maxAge !== "undefined"
                        ? new Date(Date.now() + options.maxAge * 1000)
                        : options.expires;
                },
                async parse(cookieHeader, parseOptions) {
                    if (!cookieHeader) return null;
                    let cookies = parse(cookieHeader, {...options, ...parseOptions});
                    return name in cookies
                        ? cookies[name] === ""
                            ? ""
                            : await decodeCookieValue(unsign, cookies[name], secrets)
                        : null;
                },
                async serialize(value, serializeOptions) {
                    return serialize(
                        name,
                        value === "" ? "" : await encodeCookieValue(sign, value, secrets),
                        {
                            ...options,
                            ...serializeOptions,
                        }
                    );
                },
            };
        };

export type IsCookieFunction = (object: any) => object is Cookie;

/**
 * Returns true if an object is a Remix cookie container.
 *
 * @see https://remix.run/utils/cookies#iscookie
 */
export const isCookie: IsCookieFunction = (object): object is Cookie => {
    return (
        object != null &&
        typeof object.name === "string" &&
        typeof object.isSigned === "boolean" &&
        typeof object.parse === "function" &&
        typeof object.serialize === "function"
    );
};

async function encodeCookieValue(
    sign: SignFunction,
    value: any,
    secrets: string[]
): Promise<string> {
    let encoded = encodeData(value);

    if (secrets.length > 0) {
        encoded = await sign(encoded, secrets[0]);
    }

    return encoded;
}

async function decodeCookieValue(
    unsign: UnsignFunction,
    value: string,
    secrets: string[]
): Promise<any> {
    if (secrets.length > 0) {
        for (let secret of secrets) {
            let unsignedValue = await unsign(value, secret);
            if (unsignedValue !== false) {
                return decodeData(unsignedValue);
            }
        }

        return null;
    }

    return decodeData(value);
}

function encodeData(value: any): string {
    return btoa(myUnescape(encodeURIComponent(JSON.stringify(value))));
}

function decodeData(value: string): any {
    try {
        return JSON.parse(decodeURIComponent(myEscape(atob(value))));
    } catch (error: unknown) {
        return {};
    }
}

// See: https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.escape.js
function myEscape(value: string): string {
    let str = value.toString();
    let result = "";
    let index = 0;
    let chr, code;
    while (index < str.length) {
        chr = str.charAt(index++);
        if (/[\w*+\-./@]/.exec(chr)) {
            result += chr;
        } else {
            code = chr.charCodeAt(0);
            if (code < 256) {
                result += "%" + hex(code, 2);
            } else {
                result += "%u" + hex(code, 4).toUpperCase();
            }
        }
    }
    return result;
}

function hex(code: number, length: number): string {
    let result = code.toString(16);
    while (result.length < length) result = "0" + result;
    return result;
}

// See: https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.unescape.js
function myUnescape(value: string): string {
    let str = value.toString();
    let result = "";
    let index = 0;
    let chr, part;
    while (index < str.length) {
        chr = str.charAt(index++);
        if (chr === "%") {
            if (str.charAt(index) === "u") {
                part = str.slice(index + 1, index + 5);
                if (/^[\da-f]{4}$/i.exec(part)) {
                    result += String.fromCharCode(parseInt(part, 16));
                    index += 5;
                    continue;
                }
            } else {
                part = str.slice(index, index + 2);
                if (/^[\da-f]{2}$/i.exec(part)) {
                    result += String.fromCharCode(parseInt(part, 16));
                    index += 2;
                    continue;
                }
            }
        }
        result += chr;
    }
    return result;
}


function sign(val: unknown, secret: string) {
    if ('string' != typeof val) throw new TypeError("Cookie value must be provided as a string.");
    if (null == secret) throw new TypeError("Secret key must be provided.");
    return val + '.' + crypto
        // @ts-ignore
        .createHmac('sha256', secret)
        .update(val)
        .digest('base64')
        .replace(/=+$/, '');
}

function unsign(input: unknown, secret: string) {
    if ('string' != typeof input) throw new TypeError("Signed cookie string must be provided.");
    if (null == secret) throw new TypeError("Secret key must be provided.");
    const tentativeValue = input.slice(0, input.lastIndexOf('.')),
        expectedInput = sign(tentativeValue, secret),
        expectedBuffer = Buffer.from(expectedInput),
        inputBuffer = Buffer.from(input);
    return (
        expectedBuffer.length === inputBuffer.length &&
        // @ts-ignore
        crypto.timingSafeEqual(expectedBuffer, inputBuffer)
    ) ? tentativeValue : false;
}

export const createCookie = createCookieFactory({ sign, unsign });
