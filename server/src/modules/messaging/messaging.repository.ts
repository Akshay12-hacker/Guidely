import { ConversationModel, MessageModel, UserModel, MentorProfileModel } from '../../infrastructure/database/models/index.js';
import { Conversation, Message, UserRole } from '../../shared/types.js';

export interface IMessagingRepository {
  getConversationsForUser(userId: string, role: UserRole): Promise<Conversation[]>;
  getConversationById(id: string): Promise<Conversation | null>;
  findOrCreateConversation(studentId: string, mentorId: string): Promise<Conversation>;
  getMessages(conversationId: string, limit?: number, offset?: number): Promise<Message[]>;
  createMessage(message: Message): Promise<Message>;
  markAsRead(conversationId: string, readerId: string, readerRole: UserRole): Promise<void>;
}

export class MongoMessagingRepository implements IMessagingRepository {
  async getConversationsForUser(userId: string, role: UserRole): Promise<Conversation[]> {
    const isStudent = role === 'STUDENT';
    const query = isStudent ? { studentId: userId } : { mentorId: userId };

    const docs = await ConversationModel.find(query).sort({ updatedAt: -1 }).lean();
    return Promise.all(docs.map(doc => this.populateConversation(doc)));
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const doc = await ConversationModel.findById(id).lean();
    if (!doc) return null;
    return this.populateConversation(doc);
  }

  async findOrCreateConversation(studentId: string, mentorId: string): Promise<Conversation> {
    let doc = await ConversationModel.findOne({ studentId, mentorId }).lean();
    if (doc) {
      return this.populateConversation(doc);
    }

    const convId = 'conv_' + Math.random().toString(36).substring(2, 11);
    const created = await ConversationModel.create({
      _id: convId,
      studentId,
      mentorId,
      unreadStudentCount: 0,
      unreadMentorCount: 0
    });

    return this.populateConversation(created.toObject());
  }

  async getMessages(conversationId: string, limit = 100, offset = 0): Promise<Message[]> {
    const docs = await MessageModel.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return docs.map(d => ({
      id: d._id,
      conversationId: d.conversationId,
      senderId: d.senderId,
      senderRole: d.senderRole as UserRole,
      senderName: d.senderName || undefined,
      text: d.text,
      attachments: d.attachments || [],
      isRead: Boolean(d.isRead),
      createdAt: String(d.createdAt || new Date().toISOString())
    }));
  }

  async createMessage(message: Message): Promise<Message> {
    await MessageModel.create({
      _id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      senderName: message.senderName,
      text: message.text,
      attachments: message.attachments || [],
      isRead: Boolean(message.isRead)
    });

    const isSenderStudent = message.senderRole === 'STUDENT';
    const incField = isSenderStudent ? { unreadMentorCount: 1 } : { unreadStudentCount: 1 };

    await ConversationModel.findByIdAndUpdate(message.conversationId, {
      lastMessageId: message.id,
      lastMessageText: message.text.slice(0, 120),
      lastMessageAt: message.createdAt,
      $inc: incField
    });

    return message;
  }

  async markAsRead(conversationId: string, readerId: string, readerRole: UserRole): Promise<void> {
    await MessageModel.updateMany(
      { conversationId, senderId: { $ne: readerId } },
      { $set: { isRead: true } }
    );

    const isStudent = readerRole === 'STUDENT';
    const resetField = isStudent ? { unreadStudentCount: 0 } : { unreadMentorCount: 0 };

    await ConversationModel.findByIdAndUpdate(conversationId, { $set: resetField });
  }

  private async populateConversation(doc: any): Promise<Conversation> {
    const [studentUser, mentorUser, mentorProf] = await Promise.all([
      UserModel.findById(doc.studentId).lean(),
      UserModel.findById(doc.mentorId).lean(),
      MentorProfileModel.findOne({ userId: doc.mentorId }).lean()
    ]);

    return {
      id: doc._id || doc.id,
      studentId: doc.studentId,
      mentorId: doc.mentorId,
      lastMessageId: doc.lastMessageId || undefined,
      lastMessageText: doc.lastMessageText || undefined,
      lastMessageAt: doc.lastMessageAt || undefined,
      unreadStudentCount: doc.unreadStudentCount || 0,
      unreadMentorCount: doc.unreadMentorCount || 0,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString()),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString()),
      student: studentUser ? {
        id: studentUser._id,
        fullName: studentUser.fullName,
        avatarUrl: studentUser.avatarUrl
      } : undefined,
      mentor: mentorUser ? {
        id: mentorUser._id,
        fullName: mentorUser.fullName,
        avatarUrl: mentorUser.avatarUrl,
        title: mentorProf?.title,
        company: mentorProf?.company
      } : undefined
    };
  }
}

export { MongoMessagingRepository as SqliteMessagingRepository };
