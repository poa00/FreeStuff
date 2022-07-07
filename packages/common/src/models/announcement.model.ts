/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //

export const AnnouncementApprovalStatus = [ 'pending', 'declined', 'published' ] as const
export const AnnouncementApprovalStatusArray = AnnouncementApprovalStatus as readonly string[]
export type AnnouncementApprovalStatusType = typeof AnnouncementApprovalStatus[number]


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type AnnouncementDataType = {
  _id: number
  /** UNIX Timestamp markes the last time the approval status has changed */
  published: number
  /** Current status of the announcement */
  status: AnnouncementApprovalStatusType
  /** User id of the moderator, responsible for checking the info and publishing the announcement */
  responsible: string
  /** the products in this announcement */
  products: number[]
}

/** The user mongoose object, muteable and saveable */
export type AnnouncementType = AnnouncementDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedAnnouncementType = {
  id: number
  published: number
  status: AnnouncementApprovalStatusType
  responsible: string
  products: number[]
}


// ===== MONGO SCHEMA ===== //

export const AnnouncementSchema = new Schema({
  _id: Number,
  published: Number,
  status: {
    type: String,
    enum: AnnouncementApprovalStatusArray
  },
  responsible: String,
  products: [ Number ]
}, { collection: 'announcements' })


// ===== UTILITY FUNCTIONS ===== //

export function createNewAnnouncement(): AnnouncementDataType {
  return {
    _id: 0,
    published: 0,
    status: 'pending',
    responsible: '',
    products: []
  }
}