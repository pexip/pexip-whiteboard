import { Provider } from './providers/provider'
import { checkWhiteboardConnection, getWhiteboardLink, setWhiteboardList } from './whiteboard'

const mockCheckCollaboardConnection = jest.fn()
const mockCheckConceptboardConnection = jest.fn()

jest.mock('./providers/collaboard', () => ({
  checkCollaboardConnection: (provider: Provider) => mockCheckCollaboardConnection(provider)
}))
jest.mock('./providers/conceptboard', () => ({
  checkConceptboardConnection: (provider: Provider) => mockCheckConceptboardConnection(provider)
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

// describe('createWhiteboardLink', () => {
//   it('should call createCollaboardLink if collaboard', () => {

//   })
//   it('should call createConceptboarddLink if collaboard', () => {

//   })
// })

// describe('deleteWhiteboardLink', () => {

// })
