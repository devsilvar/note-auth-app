const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test').then(async () => {
  await mongoose.connection.collection('NoteTaking').dropIndex('email_1');
  console.log('Done');
  process.exit(0);
});