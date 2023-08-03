import {z} from 'zod';

const cinameSchema = z.literal('markdown-translation');
const commandsSchema = z.union([z.literal('extract'), z.literal('compose')]);
const parametersSchema = z.array(z.string());

export type CommandName = z.infer<typeof commandsSchema>;
export type CommandParameters = z.infer<typeof parametersSchema>;

class Command<P extends {}> {
    name: CommandName;
    parameters: P;

    constructor(name: CommandName, parameters: P = {} as P) {
        this.name = name;
        this.parameters = parameters;
    }
}

class CommandParser {
    async parse(input: string): Promise<Command<{}>[]> {
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

    private parseCommand(line: string): Command<{[key: string]: string}> {
        const tokens = line.split(' ').filter(Boolean);
        if (tokens.length < 4) {
            throw new Error('invalid command string');
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const keyword = cinameSchema.parse(tokens[0]);
        const cmd = commandsSchema.parse(tokens[1]);

        const parameters = {
            input: tokens[2],
            output: tokens[3],
        };

        const command = new Command(cmd, parameters);

        return command;
    }
}

export type CommandHandler<R, I> = (parameters: I) => Promise<R>;

class CommandExecutor<R, I extends {}> {
    handlers: Map<CommandName, CommandHandler<R, I>>;

    constructor() {
        this.handlers = new Map<CommandName, CommandHandler<R, I>>();
    }

    addHandler(command: CommandName, handler: CommandHandler<R, I>): void {
        this.handlers.set(command, handler);
    }

    async execute(commands: Command<I>[]): Promise<unknown[]> {
        const outputs: unknown[] = [];

        for (const command of commands) {
            const handler = this.handlers.get(command.name);
            if (!handler) {
                continue;
            }

            outputs.push(handler(command.parameters));
        }

        return Promise.all(outputs);
    }
}

export {CommandExecutor, CommandParser, Command};
export default {CommandExecutor, CommandParser, Command};
