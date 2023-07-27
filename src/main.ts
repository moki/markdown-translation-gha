import * as core from '@actions/core';
import {Action} from './action';

try {
    const action = new Action();
    action.run();
} catch (err) {
    if (err instanceof Error) {
        core.error(`action failure(${err.name}): ${err.message}`);
        core.setFailed(err.message);
    }
}
