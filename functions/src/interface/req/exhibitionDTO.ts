export default interface exhibitionDTO {
    gallerySize?: number;
    galleryTheme?: number;
    title?: string;
    category?: number;
    posterImage?: string;
    posterOriginalImage?: string;
    posterTheme?: number;
    description?: string;
    tag: number[];
    isPublic?: boolean;
    artworkImage?: string[];
    artworkTitle?: string[];
    artworkDescription?: string[];
}