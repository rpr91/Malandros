import axios from 'axios';
import Cookies from 'js-cookie';
import httpClient from './httpClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create proper typed mock for js-cookie
const mockCookiesGet = jest.fn((key: string) => 
  key === 'csrf-token' ? 'test-token' : undefined
);

jest.mock('js-cookie', () => ({
  get: mockCookiesGet
}));

describe('httpClient CSRF integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxios);
  });

  it('should add CSRF token to POST requests', () => {
    httpClient.post('/test');
    
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/test',
      undefined,
      expect.objectContaining({
        headers: {
          'X-CSRF-Token': 'test-token'
        }
      })
    );
    expect(mockCookiesGet).toHaveBeenCalledWith('csrf-token');
  });

  it('should not add CSRF token to GET requests', () => {
    httpClient.get('/test');
    expect(mockCookiesGet).not.toHaveBeenCalled();
    expect(mockedAxios.get).toHaveBeenCalledWith('/test', undefined);
  });

  it('should refresh token on 403 error', async () => {
    // First request fails with 403
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 403 },
      config: { url: '/test', _retry: false }
    });
    
    // Mock token refresh
    mockedAxios.get.mockResolvedValueOnce({ data: {} });
    
    // Second request succeeds
    mockedAxios.post.mockResolvedValueOnce({ data: 'success' });
    
    const response = await httpClient.post('/test');
    expect(response.data).toBe('success');
    expect(mockedAxios.get).toHaveBeenCalledWith('/auth/csrf', {
      withCredentials: true
    });
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  it('should reject if token refresh fails', async () => {
    // First request fails with 403
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 403 },
      config: { url: '/test', _retry: false }
    });
    
    // Token refresh also fails
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed'));
    
    await expect(httpClient.post('/test')).rejects.toThrow('Failed');
  });
});