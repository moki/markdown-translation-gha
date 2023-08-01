import {z} from 'zod';

const cinameSchema = z.literal('markdown-translation');
const commandsSchema = z.union([z.literal('extract'), z.literal('compose')]);
const parametersSchema = z.array(z.string());

export type CommandName = z.infer<typeof commandsSchema>;
export type CommandParameters = z.infer<typeof parametersSchema>;

class Command {
    name: CommandName;
    parameters: CommandParameters;

    constructor(name: CommandName, parameters?: string[]) {
        this.name = name;
        this.parameters = parameters ?? [];
    }
}

class CommandParser {
    async parse(input: string): Promise<Command[]> {
        const lines = input.split('\n').filter(Boolean);
        const parsed = [];

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

export type CommandHandler<T> = (
    ...parameters: CommandParameters
) => Promise<T>;

class CommandExecutor<T> {
    handlers: Map<CommandName, CommandHandler<T>>;

    constructor() {
        this.handlers = new Map<CommandName, CommandHandler<T>>();
    }

    addHandler(command: CommandName, handler: CommandHandler<T>): void {
        this.handlers.set(command, handler);
    }

    async execute(commands: Command[]): Promise<unknown[]> {
        const outputs: unknown[] = [];

        for (const command of commands) {
            const handler = this.handlers.get(command.name);
            if (!handler) {
                continue;
            }

            outputs.push(handler(...command.parameters));
        }

        return Promise.all(outputs);
    }
}

export {CommandExecutor, CommandParser, Command};
export default {CommandExecutor, CommandParser, Command};
