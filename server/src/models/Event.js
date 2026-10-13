const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema(
  {
    x: {
      type: Number,
      required: false
    },
    y: {
      type: Number,
      required: false
    },
    viewport_width: {
      type: Number,
      required: false
    },
    viewport_height: {
      type: Number,
      required: false
    }
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: [true, 'event_id is required'],
      unique: true,
      trim: true
    },
    session_id: {
      type: String,
      required: [true, 'session_id is required'],
      trim: true
    },
    event_type: {
      type: String,
      required: [true, 'event_type is required'],
      enum: {
        values: ['page_view', 'click'],
        message: '{VALUE} is not a supported event_type. Allowed: page_view, click'
      }
    },
    page_url: {
      type: String,
      required: [true, 'page_url is required'],
      trim: true
    },
    timestamp: {
      type: Date,
      required: [true, 'timestamp is required']
    },
    received_at: {
      type: Date,
      required: [true, 'received_at is required']
    },
    click: {
      type: clickSchema,
      required: false
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

// Compound index for session timeline queries (chronological ordering)
eventSchema.index({ session_id: 1, timestamp: 1 });

// Compound index for page-specific queries (e.g. click heatmap filtering)
eventSchema.index({ event_type: 1, page_url: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
