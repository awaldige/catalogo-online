const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Importa o bcryptjs

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Garante que não haja usernames duplicados
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true, // Garante que não haja emails duplicados
        trim: true,
        lowercase: true,
        match: /^\S+@\S+\.\S+$/ // Regex simples para validação de email
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Uma senha deve ter no mínimo 6 caracteres
    },
    role: { // Campo para definir papéis (ex: 'user', 'admin')
        type: String,
        enum: ['user', 'admin'], // Apenas esses dois valores são permitidos
        default: 'user'
    }
}, {
    timestamps: true // Adiciona automaticamente createdAt e updatedAt
});

// Middleware para fazer o hash da senha ANTES de salvar o usuário
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) { // Só faz o hash se a senha foi modificada (ou é nova)
        const salt = await bcrypt.genSalt(10); // Gera um salt (custo de 10)
        this.password = await bcrypt.hash(this.password, salt); // Faz o hash da senha
    }
    next(); // Continua para o próximo middleware ou salva o documento
});

// Método para comparar a senha fornecida com a senha hash no banco de dados
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;