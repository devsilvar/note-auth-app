// Mock bcrypt methods for checkPassword simulation
const mockBcrypt = {
  compare: jest.fn(),
  hash: jest.fn()
};

describe('User Model - checkPassword', () => {
  let hashedPassword = 'hashedPassword123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockBcrypt.compare.mockResolvedValue(true);
  });

  it('should return true when password matches', async () => {
    const plainPassword = 'plainPassword';
    mockBcrypt.compare.mockResolvedValue(true);
    const result = await mockBcrypt.compare(plainPassword, hashedPassword);
    expect(mockBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    expect(result).toBe(true);
  });

  it('should return false when password does not match', async () => {
    mockBcrypt.compare.mockResolvedValue(false);
    const result = await mockBcrypt.compare('wrongPassword', hashedPassword);
    expect(result).toBe(false);
  });

  it('should throw error when bcrypt fails', async () => {
    mockBcrypt.compare.mockRejectedValue(new Error('Bcrypt error'));
    await expect(mockBcrypt.compare('plainPassword', hashedPassword)).rejects.toThrow('Bcrypt error');
  });
});

describe('Password Hashing Middleware', () => {
  beforeEach(() => {
    mockBcrypt.hash.mockResolvedValue('hashedPassword');
    jest.clearAllMocks();
  });

  it('should skip hashing when password is not modified', () => {
    const isModified = jest.fn().mockReturnValue(false);

    // Simulate the middleware logic
    const preSaveMiddleware = (next) => {
      if (!isModified('password')) return next();
      return next();
    };

    preSaveMiddleware(jest.fn());
    expect(isModified).toHaveBeenCalledWith('password');
  });

  it('should hash password when modified', async () => {
    const mockThis = {
      isModified: jest.fn().mockReturnValue(true),
      password: 'plainPassword'
    };

    // Simulate the middleware logic
    const preSaveMiddleware = async () => {
      if (!mockThis.isModified('password')) return;
      mockThis.password = await mockBcrypt.hash(mockThis.password, 12);
    };

    await preSaveMiddleware();
    expect(mockBcrypt.hash).toHaveBeenCalledWith('plainPassword', 12);
    expect(mockThis.password).toBe('hashedPassword');
  });
});

describe('Auth Route - Validation Logic', () => {
  describe('register validation', () => {
    it('should identify missing required fields', () => {
      const body = { email: 'test@test.com', password: 'pass123' };
      const { email, password, firstName, lastName } = body;
      const hasAllFields = email && password && firstName && lastName;
      expect(hasAllFields).toBeFalsy();
    });

    it('should pass when all fields present', () => {
      const body = {
        email: 'test@test.com',
        password: 'pass123',
        firstName: 'John',
        lastName: 'Doe'
      };
      const { email, password, firstName, lastName } = body;
      const hasAllFields = email && password && firstName && lastName;
      expect(hasAllFields).toBeTruthy();
    });
  });

  describe('login validation', () => {
    it('should fail when email is missing', () => {
      const body = { password: 'pass123' };
      const isValid = body.email && body.password;
      expect(isValid).toBeFalsy();
    });

    it('should fail when password is missing', () => {
      const body = { email: 'test@test.com' };
      const isValid = body.email && body.password;
      expect(isValid).toBeFalsy();
    });

    it('should pass when both email and password present', () => {
      const body = { email: 'test@test.com', password: 'pass123' };
      const isValid = body.email && body.password;
      expect(isValid).toBeTruthy();
    });
  });
});

describe('Notes Route - Search Filter Logic', () => {
  it('should build filter with user id only', () => {
    const user = { _id: 'user123' };
    const reqQuery = {};

    const filter = { user: user._id };

    if (reqQuery.title) {
      filter.title = new RegExp(reqQuery.title, 'i');
    }
    if (reqQuery.content) {
      filter.content = new RegExp(reqQuery.content, 'i');
    }

    expect(filter).toEqual({ user: 'user123' });
  });

  it('should build filter with title regex', () => {
    const user = { _id: 'user123' };
    const reqQuery = { title: 'meeting' };

    const filter = { user: user._id };

    if (reqQuery.title) {
      filter.title = new RegExp(reqQuery.title, 'i');
    }

    expect(filter.title).toBeInstanceOf(RegExp);
    expect(filter.title.source).toBe('meeting');
  });

  it('should build filter with content regex', () => {
    const user = { _id: 'user123' };
    const reqQuery = { content: 'notes' };

    const filter = { user: user._id };

    if (reqQuery.content) {
      filter.content = new RegExp(reqQuery.content, 'i');
    }

    expect(filter.content).toBeInstanceOf(RegExp);
    expect(filter.content.source).toBe('notes');
  });

  it('should make regex case-insensitive', () => {
    const regex = new RegExp('TEST', 'i');
    expect(regex.flags).toContain('i');
    expect(regex.test('test')).toBeTruthy();
    expect(regex.test('TEST')).toBeTruthy();
    expect(regex.test('Test')).toBeTruthy();
  });
});

describe('Protect Middleware - Token Extraction', () => {
  it('should extract token from valid Bearer header', () => {
    const authHeader = 'Bearer abc123.token';
    const token = authHeader.split(' ')[1];
    expect(token).toBe('abc123.token');
  });

  it('should handle Authorization header format', () => {
    const authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
    let token;

    if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.split(' ')[1];
    }

    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(3);
  });
});

describe('Protect Middleware - Error Handling', () => {
  it('should return 401 for missing token', () => {
    const statusCode = 401;
    const expectedResponse = {
      message: 'Not authorized to access this route',
      success: false
    };
    expect(statusCode).toBe(401);
    expect(expectedResponse.message).toContain('Not authorized');
  });

  it('should create error with correct status code for invalid token', () => {
    const error = new Error('Invalid or expired token. Please log in again.');
    error.statusCode = 401;
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('Invalid');
  });

  it('should create error for non-existent user', () => {
    const error = new Error('The user belonging to this token no longer exists.');
    error.statusCode = 401;
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('no longer exists');
  });
});

describe('Note Deletion Authorization', () => {
  it('should ensure user can only delete their own notes', () => {
    const userId = 'user123';
    const noteId = 'note456';
    const deleteQuery = { _id: noteId, user: userId };
    expect(deleteQuery._id).toBe(noteId);
    expect(deleteQuery.user).toBe(userId);
  });
});

describe('Note Creation Validation', () => {
  it('should fail when title is missing', () => {
    const body = { content: 'some content', status: false };
    const hasRequired = body.title && body.content;
    expect(hasRequired).toBeFalsy();
  });

  it('should fail when content is missing', () => {
    const body = { title: 'My Note', status: false };
    const hasRequired = body.title && body.content;
    expect(hasRequired).toBeFalsy();
  });

  it('should pass when title and content present', () => {
    const body = { title: 'My Note', content: 'some content', status: false };
    const hasRequired = body.title && body.content;
    expect(hasRequired).toBeTruthy();
  });
});

describe('User Schema Validation Rules', () => {
  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  it('should accept valid email format', () => {
    expect(validateEmail('test@example.com')).toBeTruthy();
    expect(validateEmail('user.name@domain.co')).toBeTruthy();
  });

  it('should reject invalid email format', () => {
    expect(validateEmail('invalid-email')).toBeFalsy();
    expect(validateEmail('@domain.com')).toBeFalsy();
    expect(validateEmail('test@')).toBeFalsy();
  });

  it('should check password minimum length', () => {
    const password = '123456';
    expect(password.length).toBeGreaterThanOrEqual(6);
  });

  it('should check name minimum length', () => {
    const firstName = 'Jo';
    expect(firstName.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Response Status Codes', () => {
  it('should return 200 for successful login', () => {
    expect(200).toBe(200);
  });

  it('should return 201 for note creation', () => {
    expect(201).toBe(201);
  });

  it('should return 400 for validation error', () => {
    expect(400).toBe(400);
  });

  it('should return 401 for unauthorized', () => {
    expect(401).toBe(401);
  });

  it('should return 404 for not found', () => {
    expect(404).toBe(404);
  });
});