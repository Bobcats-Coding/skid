const mockV2Services = {
  verifications: {
    create: jest.fn().mockResolvedValue({ status: 'approved' }),
  },
}

const mockClient = {
  verify: {
    v2: {
      services: jest.fn().mockReturnValue(mockV2Services),
    },
  },
}

export default jest.fn().mockImplementation(() => mockClient)
