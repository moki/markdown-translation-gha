import * as exec from '@actions/exec';

class GithubClient {
    async checkoutPR(number: string): Promise<void> {
        if (!number?.length) {
            throw new Error('specify pr number');
        }

        await exec.exec(`gh pr checkout ${number}`);
    }
}

export {GithubClient};
export default {GithubClient};
