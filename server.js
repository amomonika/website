const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

const supabaseUrl = 'https://gvdgcxotqxkemfljxxff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2ZGdjeG90cXhrZW1mbGp4eGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzA5MDIsImV4cCI6MjA2MDIwNjkwMn0.yrvEi7R1MhtPV4pYmxDu6eSoCZPfKAWLW3aC_vF4JL0';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(bodyParser.json());
app.use(cors());


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const { data, error } = await supabase
            .from('Users')
            .select('*')
            .eq('username', username)
            .eq('password', password) // bycrypted password check
            .single();

        if (error || !data) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        console.log('User logged in:', username);
        res.json({ message: 'Login successful', user: data });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Register endpoint (plain text)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
            .from('Users')
            .select('*')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const { data, error } = await supabase
            .from('Users')
            .insert([{ username, password }])
            .select('*')
            .single();
            
        if (error) {
            return res.status(500).json({ message: 'Error registering user', error });
        }
        console.log('User registered:', username);
        res.status(201).json({ message: 'User registered successfully', user: data }); 
    } 
    catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/getHighscores', async (req, res) => {
    try{
        const {data, error} = await supabase
        .from('Users')
        .select('username, snakeHighscore, snakeSpeed');

        if(error){
            console.log('Error fetching highscores')
            return res.status(500).json({ message: 'Error fetching highscores', error });
        }
        res.status(200).json({ message: 'Highscores retrieved successfully', players: data });
    }
    catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/updateHighscore', async (req, res) => {
    try{
        const {username, highscore, speed} = req.body
        
        const {error} = await supabase
        .from('Users')
        .update({snakeHighscore: highscore, snakeSpeed: speed})
        .eq('username', username)
        if(error){
            return res.status(500).json({ message: 'Error updating highscore', error: error });
        }
        return res.status(200).json({ message: 'Highscore updated successfully' });
    }
    catch (err) {
        console.error('Error updating highscore:', err);
        res.status(500).json({ message: 'Server error' });
    }

});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
