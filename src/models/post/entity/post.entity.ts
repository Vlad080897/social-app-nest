import User from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostPhoto } from './post-photo.entity';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.created_posts)
  creator: User;

  @ManyToOne(() => User, (user) => user.own_posts)
  owner: User;

  @OneToMany(() => PostPhoto, (postPhoto) => postPhoto.post)
  photos: PostPhoto[];
}
