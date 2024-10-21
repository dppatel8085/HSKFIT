import { IsNotEmpty, IsOptional } from "class-validator";

export class StoriesRes {

    @IsNotEmpty()
    public id: number

    @IsNotEmpty()
    public _id: string

    @IsOptional()
    public storiesTitle: string;

    @IsOptional()
    public storiesImage: string;

    @IsOptional()
    public externalLink: string;

    @IsOptional()
    public storyViewImg: string;

    @IsOptional()
    public storyStartDate: Date;

    @IsOptional()
    public storyEndDate: Date;

    @IsOptional()
    public headers: any;

    @IsOptional()
    public isActive: any;


}