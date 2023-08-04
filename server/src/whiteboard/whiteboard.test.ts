import { Provider } from './providers/provider'
import { checkWhiteboardConnection, createWhiteboardLink, deleteWhiteboardLink, getWhiteboardLink, setWhiteboardList } from './whiteboard'

const mockCheckCollaboardConnection = jest.fn()
const mockCheckConceptboardConnection = jest.fn()
const mockCreateCollaboardLink = jest.fn(async (conference: string) => await Promise.resolve(conference))
const mockCreateConceptboardLink = jest.fn(async (conference: string) => await Promise.resolve(conference))
const mockDeleteCollaboardLink = jest.fn(async (conference: string) => await Promise.resolve(conference))
const mockDeleteConceptboardLink = jest.fn(async (conference: string) => await Promise.resolve(conference))

jest.mock('./providers/collaboard', () => ({
  checkCollaboardConnection: (provider: Provider) => mockCheckCollaboardConnection(provider),
  createCollaboardLink: async (conference: string) => await mockCreateCollaboardLink(conference),
  deleteCollaboardLink: async (conference: string) => await mockDeleteCollaboardLink(conference)
}))
jest.mock('./providers/conceptboard', () => ({
  checkConceptboardConnection: (provider: Provider) => mockCheckConceptboardConnection(provider),
  createConceptboardLink: async (conference: string) => await mockCreateConceptboardLink(conference),
  deleteConceptboardLink: async (conference: string) => await mockDeleteConceptboardLink(conference)
}))

describe('checkWhiteboardConnection', () => {
  beforeEach(() => {
    mockCheckCollaboardConnection.mockClear()
    mockCheckConceptboardConnection.mockClear()
  })
  it('should call createCollaboardLink if provider is collaboard', async () => {
    await checkWhiteboardConnection(Provider.Collaboard)
    expect(mockCheckCollaboardConnection).toBeCalledTimes(1)
    expect(mockCheckConceptboardConnection).not.toBeCalled()
  })
  it('should call createConceptboarddLink if provider is conceptboard', async () => {
    await checkWhiteboardConnection(Provider.Conceptboard)
    expect(mockCheckCollaboardConnection).not.toBeCalled()
    expect(mockCheckConceptboardConnection).toBeCalledTimes(1)
  })
  it('should trigger an error if the provider is not supported', async () => {
    expect.assertions(1)
    try {
      await checkWhiteboardConnection('unknown-provider' as Provider)
    } catch (e: any) {
      expect(e.message).toMatch('Unknown whiteboard provider')
    }
  })
})

describe('getWhiteboardLink', () => {
  it('should get the whiteboard link if the conference exist', () => {
    const conference = 'my-conference'
    const whiteboardLink = 'my-link'
    setWhiteboardList([{
      conference,
      provider: Provider.Collaboard,
      whiteboardLink
    }])
    const link = getWhiteboardLink(conference)
    expect(link).toBe(whiteboardLink)
  })
  it('should return null if the conference doesn\'t exist', () => {
    const conference = 'my-conference'
    const whiteboardLink = 'my-link'
    setWhiteboardList([{
      conference,
      provider: Provider.Collaboard,
      whiteboardLink
    }])
    const link = getWhiteboardLink('wrong-conference')
    expect(link).toBe(null)
  })
})

describe('createWhiteboardLink', () => {
  beforeEach(() => {
    mockCreateCollaboardLink.mockClear()
    mockCreateConceptboardLink.mockClear()
    setWhiteboardList([])
  })
  it('should save the new whiteboard in the array', async () => {
    const conference = 'my-conference'
    await createWhiteboardLink(Provider.Conceptboard, conference)
    const link = getWhiteboardLink(conference)
    expect(link).toBe(conference)
  })
  it('should call createCollaboardLink if provider is collaboard', async () => {
    const conference = 'my-conference'
    await createWhiteboardLink(Provider.Collaboard, conference)
    expect(mockCreateCollaboardLink).toBeCalledTimes(1)
    expect(mockCreateConceptboardLink).not.toBeCalled()
  })
  it('should call createConceptboarddLink if provider is conceptboard', async () => {
    const conference = 'my-conference'
    await createWhiteboardLink(Provider.Conceptboard, conference)
    expect(mockCreateCollaboardLink).not.toBeCalled()
    expect(mockCreateConceptboardLink).toBeCalledTimes(1)
  })
  it('should trigger an error if the provider is not supported', async () => {
    const conference = 'my-conference'
    expect.assertions(1)
    try {
      await createWhiteboardLink('unknown-provider' as Provider, conference)
    } catch (e: any) {
      expect(e.message).toMatch('Unknown whiteboard provider')
    }
  })
})

describe('deleteWhiteboardLink', () => {
  const conference = 'my-conference'
  const link = 'my-link'
  beforeEach(() => {
    mockDeleteCollaboardLink.mockClear()
    mockDeleteConceptboardLink.mockClear()
    setWhiteboardList([{
      conference,
      whiteboardLink: link,
      provider: Provider.Collaboard
    }])
  })
  it('should remove the whiteboard from the whiteboardList', async () => {
    const beforeLink = getWhiteboardLink(conference)
    await deleteWhiteboardLink(conference)
    const afterLink = getWhiteboardLink(conference)
    expect(beforeLink).toBe(link)
    expect(afterLink).toBe(null)
  })
  it('should call deleteCollaboardLink if provider is collaboard', async () => {
    setWhiteboardList([{
      conference,
      whiteboardLink: link,
      provider: Provider.Collaboard
    }])
    await deleteWhiteboardLink(conference)
    expect(mockDeleteCollaboardLink).toBeCalledTimes(1)
    expect(mockDeleteConceptboardLink).not.toBeCalled()
  })
  it('should call deleteConceptboardLink if provider is conceptboard', async () => {
    setWhiteboardList([{
      conference,
      whiteboardLink: link,
      provider: Provider.Conceptboard
    }])
    await deleteWhiteboardLink(conference)
    expect(mockDeleteCollaboardLink).not.toBeCalled()
    expect(mockDeleteConceptboardLink).toBeCalledTimes(1)
  })
  it('should remove the whiteboard from the list even if the deletion from the provider fails', async () => {
    const error = 'my-error'
    mockDeleteCollaboardLink.mockRejectedValue(error)
    expect.assertions(2)
    try {
      await deleteWhiteboardLink(conference)
    } catch (e) {
      expect(e).toEqual(error)
    }
    const afterLink = getWhiteboardLink(conference)
    expect(afterLink).toBe(null)
  })
})
