import request from 'supertest';
import app from '../server';
import Author from '../models/author';

describe('GET /authors', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should respond with a list of author names when authors exist', async () => {
        jest.spyOn(Author, 'getAllAuthors').mockResolvedValue([
            'Jane Austen',
            'Charles Dickens',
            'Mark Twain'
        ]);

        const response = await request(app).get('/authors');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            'Jane Austen',
            'Charles Dickens',
            'Mark Twain'
        ]);
    });

    it('should respond with "No authors found" when there are no authors', async () => {
        jest.spyOn(Author, 'getAllAuthors').mockResolvedValue([]);

        const response = await request(app).get('/authors');
        expect(response.status).toBe(200);
        expect(response.text).toBe('No authors found');
    });

    it('should respond with "No authors found" when an error occurs', async () => {
        jest.spyOn(Author, 'getAllAuthors').mockImplementation(() => {
            throw new Error('Test error');
        });

        const response = await request(app).get('/authors');
        expect(response.status).toBe(200);
        expect(response.text).toBe('No authors found');
    });
});