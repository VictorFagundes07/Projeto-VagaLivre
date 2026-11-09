import {AxiosError, AxiosResponse} from 'axios';
import {api, errorMessage, setToken} from '../src/api';

test('inclui o token nas requisições e o remove ao sair', () => {
  setToken('token-teste');
  expect(api.defaults.headers.common.Authorization).toBe('Bearer token-teste');
  setToken(null);
  expect(api.defaults.headers.common.Authorization).toBeUndefined();
});

test('apresenta os erros de validação retornados pelo ASP.NET', () => {
  const response = {status: 400, data: {errors: {Title: ['Título obrigatório.'], Latitude: ['Latitude inválida.']}}} as AxiosResponse;
  const error = new AxiosError('Bad Request', '400', undefined, undefined, response);
  expect(errorMessage(error)).toBe('Título obrigatório.\nLatitude inválida.');
});

test('explica falha de conexão com o backend', () => {
  expect(errorMessage(new AxiosError('Network Error'))).toContain('Confira se o backend está ligado');
});
