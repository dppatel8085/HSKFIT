import { Service } from "typedi";
import { env } from "../../env";
import { JwtService } from "../../auth/JwtService";

@Service()
export class DecodeTokenService {

    constructor(
        @Service() private jwtService: JwtService
    ){}

    public async DecodeToken(Token: string) {
        let token = Token.replace('Bearer', '');
        token = token.trim();
        const decodedToken = await this.jwtService.getIdByToken(token, env.jwt.secret);
        return decodedToken;
    }

    public async Decode(Token: string) {
        let token = Token.replace('Bearer', '');
        token = token.trim();
        const decodedToken = await this.jwtService.decode(token, env.jwt.secret);
        return decodedToken;
    }
}