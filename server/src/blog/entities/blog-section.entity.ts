import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_sections')
@Index(['blogId'])
export class BlogSection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  blogId!: string;

  @ManyToOne(() => Blog, (blog) => blog.sections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'blogId',
  })
  blog!: Blog;

  @Column({
    length: 255,
  })
  title!: string;

  @Column({
    type: 'text',
  })
  description!: string;

  @Column({
    nullable: true,
    length: 500,
  })
  imageUrl?: string;

  @Column({
    default: 0,
  })
  sortOrder!: number;
}
