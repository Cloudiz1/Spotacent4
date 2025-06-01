export interface InputCommand {
    name: string,
    args: Array<string>,
}

export interface CommandDescription {
    name: string,
    description: string,
    syntax?: Array<string>
}