import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { AdminPermissionsMap } from '../admin/permissions/permission.constants';

@Entity()
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** super_admin = full access, admin = permission-based */
  @Column({ type: 'varchar', length: 40, default: 'admin' })
  role!: 'super_admin' | 'admin';

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  displayName!: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'jsonb', default: {} })
  permissions!: AdminPermissionsMap;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
