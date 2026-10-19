const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const Task = require('./models/task');
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('تم اعداد الapi بنجاح')
})

app.get('/api/tasks', async (req, res) => {
    try{
        const tasks= await Task.find().sort({createdAt: -1});
        res.status(200).json(tasks);
    }catch(err){
        console.error('Error fetching tasks:', err);
        res.status(500).json({
            msg: 'حدث خطأ يرجى إعادة المحاولة.'
        })
    }
});


app.post('/api/tasks', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({
                msg: 'عنوان المهمة مطلوب'
            })
        }

        const newTask = new Task({
            text: text.trim(),
        });

        const saveTask = await newTask.save();
        res.status(201).json(saveTask)
    } catch (err) {
        res.status(500).json({
            msg: 'حدث خطأ يرجى إعادة المحاولة.'
        })
    }
})



app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { completed } = req.body

    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        msg: 'حالة المهمة غير صحيحة',
      })
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { completed },
      { new: true, runValidators: true }
    )

    if (!task) {
      return res.status(404).json({
        msg: 'المهمة غير موجودة',
      })
    }

    res.status(200).json(task)
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        msg: 'معرّف المهمة غير صالح',
      })
    }

    console.error('Error updating task:', err)
    res.status(500).json({
      msg: 'حدث خطأ أثناء تحديث المهمة',
    })
  }
})



app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({
        msg: 'المهمة غير موجودة',
      })
    }

    res.status(200).json({
      msg: 'تم حذف المهمة بنجاح',
      task,
    })
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        msg: 'معرّف المهمة غير صالح',
      })
    }

    console.error('Error deleting task:', err)

    res.status(500).json({
      msg: 'حدث خطأ أثناء حذف المهمة',
    })
  }
})


const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB connected successfully');

        app.listen(process.env.PORT || 5000, () => {
            console.log('Server is running');
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
};

startServer();


