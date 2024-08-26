#!/usr/bin/env node

import { config } from 'dotenv'
import { writeFileSync } from 'node:fs'

const env = {}

config({
    path: ['.env.local', '.env'],
    processEnv: env,
})

writeFileSync('.dev.vars', Object.entries(env).map(([key, value]) => `${key} = "${value}"`).join('\n'))

