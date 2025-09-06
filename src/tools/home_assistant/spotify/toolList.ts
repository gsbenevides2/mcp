import { GetAlbumTracks } from "./getAlbumTracks";
import { GetArtistAlbums } from "./getArtistAlbums";
import { GetArtistTopTracks } from "./getArtistTopTracks";
import { GetSpotifyData } from "./getData";
import { ListAccounts } from "./listAccounts";
import { MakeSpotifyOperation } from "./makeOperation";
import { PlayAlbum } from "./playAlbum";
import { PlayArtist } from "./playArtist";
import { PlaySong } from "./playSong";
import { SearchAlbum } from "./searchAlbum";
import { SearchArtist } from "./searchArtist";
import { SearchSong } from "./searchSong";

export const homeAssistantSpotifyToolsList = [
	new GetAlbumTracks(),
	new GetArtistAlbums(),
	new GetArtistTopTracks(),
	new GetSpotifyData(),
	new ListAccounts(),
	new MakeSpotifyOperation(),
	new PlayAlbum(),
	new PlayArtist(),
	new PlaySong(),
	new SearchAlbum(),
	new SearchArtist(),
	new SearchSong(),
];
