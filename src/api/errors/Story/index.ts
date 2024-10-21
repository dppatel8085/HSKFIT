import { HttpError } from "routing-controllers";

export class StoryIdNotFound extends HttpError {

    constructor() {
        super(404, 'ERROR.STORY_ID_NOT_FOUND ')
    }
}