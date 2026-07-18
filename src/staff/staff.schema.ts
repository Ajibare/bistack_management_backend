import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StaffDocument = HydratedDocument<Staff>;

export type StaffRole =
  | 'Tutor'
  | 'Class Teacher'
  | 'Admin'
  | 'Manager'
  | 'Receptionist'
  | 'Accountant'
  | 'IT Support'
  | 'Other';

@Schema({ timestamps: true, collection: 'staff' })
export class Staff {
  // @Prop({ required: true, unique: true })
  @Prop({ required: true})
  sn: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  role: string;

  // Comma-separated list of classes/groups this staff is assigned to
  // (e.g. "Full-Stack Web Development, Mobile App Development").
  // Kept as a simple string so the API matches the rest of the codebase
  // (the students/finance modules also use plain strings).
  @Prop({ default: '' })
  assignedClasses: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: 'Active' })
  status: string;

  @Prop({ required: true })
  date: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
