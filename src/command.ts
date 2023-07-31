import {z} from 'zod';

const cinameSchema = z.literal('markdown-translation');
const commandsSchema = z.union([z.literal('extract'), z.literal('compose')]);
const parametersSchema = z.array(z.string());

export type CommandName = z.infer<typeof commandsSchema>;
export type CommandParameters = z.infer<typeof parametersSchema>;

class Command {
    name: CommandName;
    parameters: CommandParameters;

    constructor(name: CommandName, parameters: string[]) {
        this.name = name;
        this.parameters = parameters;
    }
}

class CommandParser {
    input: string;

    constructor(input: string) {
        this.input = input;
    }

    async parse(): Promise<Command[]> {
        const parsed = [];

        const lines = this.input.split('\n').filter(Boolean);

        for (const line of lines) {
            try {
                const command = this.parseCommand(line);
                parsed.push(command);
            } catch (err: unknown) {
                continue;
            }
        }

        return parsed;
    }

    parseCommand(line: string): Command {
        const tokens = line.split(' ').filter(Boolean);
        if (tokens.length < 4) {
            throw new Error('invalid command string');
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const keyword = cinameSchema.parse(tokens[0]);
        const cmd = commandsSchema.parse(tokens[1]);
        const parameters = parametersSchema.parse(tokens.slice(2));

        const command = new Command(cmd, parameters);

        return command;
    }
}

export {CommandParser, Command};
export default {CommandParser, Command};
