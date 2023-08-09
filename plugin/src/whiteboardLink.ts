let whiteboardLink = ''

const setWhiteboardLink = (link: string): void => {
  whiteboardLink = link
}

const getWhiteboardLink = (): string => {
  return whiteboardLink
}

export {
  setWhiteboardLink,
  getWhiteboardLink
}
