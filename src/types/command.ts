export interface inputCommand {
    name: string,
    args: Array<string>,
}

export interface commandDescription {
    name: string,
    description: string,
    syntax?: Array<string>
}

// export interface simplifiedCommandDescription {
//     description: string,
//     syntax?: Array<string>
// }