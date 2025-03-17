import request from 'supertest';
import app from '../server';
import Author from '../models/author';
import mongoose from 'mongoose';

describe('GET /authors', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should respond with a list of author names when authors exist', async () => {
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

    test('should respond with "No authors found" when there are no authors', async () => {
        jest.spyOn(Author, 'getAllAuthors').mockResolvedValue([]);

        const response = await request(app).get('/authors');
        expect(response.status).toBe(200);
        expect(response.text).toBe('No authors found');
    });

    test('should respond with "No authors found" when an error occurs', async () => {
        jest.spyOn(Author, 'getAllAuthors').mockImplementation(() => {
            throw new Error('Test error');
        });

        const response = await request(app).get('/authors');
        expect(response.status).toBe(200);
        expect(response.text).toBe('No authors found');
    });
});

//tests db integration
describe('GET /authors (database integration)', () => {
    beforeAll(async () => {
        // Connect to a test database (ensure it exists or use mongodb-memory-server)
        await mongoose.connect('mongodb://127.0.0.1:27017/test_library_db', {
        });
        // Seed the database with test authors
        await Author.create([
            { first_name: 'Jane', family_name: 'Austen' },
            { first_name: 'Charles', family_name: 'Dickens' },
            { first_name: 'Mark', family_name: 'Twain' }
        ]);
    });

    afterAll(async () => {
        // Clean up the database
        await Author.deleteMany({});
        await mongoose.disconnect();
    });

    test('should return a list of author names from the database', async () => {
        const response = await request(app).get('/authors');
        expect(response.status).toBe(200);
        // Assuming that the getAllAuthors function returns an array of author names sorted by family_name
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(
            expect.arrayContaining(["Austen, Jane :  - ", "Dickens, Charles :  - ", "Twain, Mark :  - "])
        );
    });
});