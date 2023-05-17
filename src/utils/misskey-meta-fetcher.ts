import axios, { AxiosResponse } from "axios"

type Args = {
    host: string
}

type Data = {
    version: string
    name: string
    uri: string
    iconUrl: string
    disableRegistration: boolean
}

export const misskeyMetaFetcher = (args: Args) =>
    axios
        .post(`https://${args.host}/api/meta`, { detail: false })
        .then((data: AxiosResponse<Data>) => data.data)
