import { IsNotEmpty, IsOptional } from "class-validator";

export class StoriesReq {

    @IsNotEmpty()
    public storiesTitle: string;

    @IsNotEmpty()
    public storiesImage: string;

    @IsNotEmpty()
    public externalLink: string;

    @IsNotEmpty()
    public storyViewImg: string;

    @IsNotEmpty()
    public storyStartDate: Date;

    @IsNotEmpty()
    public storyEndDate: Date;

    @IsOptional()
    public headers: any;

}