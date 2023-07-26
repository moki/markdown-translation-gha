import * as core from '@actions/core';

async function run(): Promise<void> {
    try {
        const name = core.getInput('name');
        core.debug(`Hello, ${name}!`);
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run();
