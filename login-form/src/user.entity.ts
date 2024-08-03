import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('users')
export class User{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({unique: true})
    email: string;

    @Column({unique: true})
    username: string;

    @Column()
    password: string;
}
