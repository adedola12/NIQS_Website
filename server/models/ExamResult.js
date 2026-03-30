const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema(
  {
    examType:         { type: String, required: true, trim: true },   // 'TPC', 'GDE', 'Professional Interview', etc.
    sitting:          { type: String, required: true, trim: true },   // 'March 2024'
    centre:           { type: String, required: true, trim: true, default: 'Nationwide' },
    resultsPublished: { type: String, trim: true, default: '' },      // 'June 2024'
    status:           { type: String, enum: ['Published', 'Pending', 'Upcoming'], default: 'Pending' },
    year:             { type: Number },
    resultFileUrl:    { type: String, trim: true, default: '' },      // optional PDF / link
    sortOrder:        { type: Number, default: 0 },
    createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ExamResult', examResultSchema);
