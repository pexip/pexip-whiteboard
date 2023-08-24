let infinityVersion = '32'

export const setVersion = (version: string): void => {
  infinityVersion = version
}

export const getVersion = (): string => {
  return infinityVersion
}
