import axios, { AxiosResponse } from "axios"

type Args = {
    host: string
}

export type MetaData = {
    name: string
    iconUrl: string
    version: string
    disableRegistration: boolean
}

export const misskeyMetaFetcher = async (args: Args) =>
    await axios
        .post(`https://${args.host}/api/meta`, { detail: false })
        .then((data: AxiosResponse<MetaData>) => data.data)
