const mongoose = require('mongoose');
require('mongoose-slug-generator');

mongoose.plugin(require('mongoose-slug-generator'));

module.exports = {
  connect: () => {
    return mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
};