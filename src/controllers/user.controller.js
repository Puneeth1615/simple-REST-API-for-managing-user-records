const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'users.json');

const readUsersFromFile = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeUsersToFile = (users) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
};

const validateUser = (user) => {
    if (!user.name || typeof user.name !== 'string' || user.name.trim().length < 2) {
        return 'Name is required and must be at least 2 characters.';
    }
    if (!user.email || !/^\S+@\S+\.\S+$/.test(user.email)) {
        return 'Valid email is required.';
    }
    return null; 
};


exports.getAllUsers = (req, res) => {
    const users = readUsersFromFile();
    res.json(users);
};

exports.createUser = (req, res) => {
    const users = readUsersFromFile();
    const { name, email } = req.body;

    const validationError = validateUser({ name, email });
    if (validationError) {
        return res.status(400).json({ message: 'Validation failed', details: [validationError] });
    }

    if (users.some(user => user.email === email)) {
        return res.status(409).json({ message: 'Validation failed', details: ['Email already exists.'] });
    }

    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    const newUser = {
        id: nextId,
        name,
        email
    };
    users.push(newUser);
    
    writeUsersToFile(users); 
    
    res.status(201).json(newUser);
};

exports.updateUser = (req, res) => {
    let users = readUsersFromFile();
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid User ID format.' });
    }
    
    const { name, email } = req.body;
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: `User with ID ${userId} not found.` });
    }

    const validationError = validateUser({ name, email });
    if (validationError) {
        return res.status(400).json({ message: 'Validation failed', details: [validationError] });
    }

    if (users.some(user => user.email === email && user.id !== userId)) {
        return res.status(409).json({ message: 'Validation failed', details: ['Email already exists.'] });
    }

    users[userIndex] = {
        ...users[userIndex],
        name,
        email
    };

    writeUsersToFile(users); 
    
    res.json(users[userIndex]);
};

exports.deleteUser = (req, res) => {
    let users = readUsersFromFile();
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid User ID format.' });
    }
    
    const initialLength = users.length;
    
    users = users.filter(user => user.id !== userId);

    if (users.length === initialLength) {
        return res.status(404).json({ message: `User with ID ${userId} not found.` });
    }

    writeUsersToFile(users);

    res.status(204).send(); 
};