import * as exec from '@actions/exec';

class GithubClient {
    private token: string;

    constructor(token: string) {
        this.token = token;
        this.configure();
    }

    private configure(): void {
        process.env['GITHUB_TOKEN'] = this.token;
    }

    async checkoutPR(number: string): Promise<void> {
        if (!number?.length) {
            throw new Error('specify pr number');
        }

        await exec.exec(`gh pr checkout ${number}`);
    }
}

export {GithubClient};
export default {GithubClient};
