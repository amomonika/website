const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = 3000;

const supabaseUrl = process.env.DB_URL;
const supabaseKey = process.env.JWT_SECRET;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(bodyParser.json());
app.use(cors());


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('Users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {return res.status(400).json({ message: 'Invalid username or password' })}

        const passwordMatch = await bcrypt.compare(password, user.password)

        if(!passwordMatch)  {return res.status(400).json({message: "Invalid username or password"})}

        delete user.password;
        console.log('User logged in:', username);
        res.json({ message: 'Login successful', user: user});

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Register endpoint (plain text)
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
            .from('Users')
            .select('*')
            .eq('username', username)
            .maybeSingle();

        if (existingUser)   {return res.status(400).json({ message: 'User already exists' });}


        const { data: user, error: insertError} = await supabase
            .from('Users')
            .insert([{ username: username, password: hashedPassword }])
            .select('*')
            .single();
            
        if (insertError)  {return res.status(500).json({ message: 'Error registering user', insertError });}

        delete user.password;
        console.log('User registered:', username);
        res.status(201).json({ message: 'User registered successfully', user}); 
    } 
    catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/getHighscores', async (req, res) => {
    try{
        const {data: players, error} = await supabase
        .from('Users')
        .select('username, snakeHighscore, snakeSpeed');

        if(error){
            console.log('Supabase error in getHighscores')
            return res.status(500).json({ message: 'Error fetching highscores', error });
        }
        res.status(200).json({ message: 'Highscores retrieved successfully', players});
    }
    catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/updateHighscore', async (req, res) => {
    const {username, highscore: newHighscore, speed: newSpeed} = req.body
    let oldHighscore
    
    try{
        const {data, error: selectError} = await supabase
        .from('Users')
        .select('snakeHighscore')
        .eq('username', username)
        .single()

        if(selectError){
            return res.status(500).json({ message: 'DbError selecting old Highscore', error: selectError});
        }
    
        oldHighscore = data.snakeHighscore;
    }
    catch(err){
        console.log("Error while selecting old Highscore for comparison:", err);
        return res.status(500).json({ message: 'Server error' });
    }

    if (newHighscore <= oldHighscore){return};

    try{
        const {error: updateError} = await supabase
        .from('Users')
        .update({snakeHighscore: newHighscore, snakeSpeed: newSpeed})
        .eq('username', username)

        if(updateError){
            return res.status(500).json({ message: 'DbError updating highscore', error: updateError });
        }

        console.log("Updated highscore of player:", username, "from", oldHighscore, "to", newHighscore)
        return res.status(200).json({ message: 'Highscore updated successfully' });
    }
    catch(err){
        console.log("Error while updating old Highscore for comparison:", err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Start server
app.listen(PORT, 'localhost', () => {
    console.log(`Server running on https://localhost:${PORT}`);
});
