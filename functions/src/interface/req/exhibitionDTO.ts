export default interface exhibitionDTO {
    title?: string;
    category?: number;
    posterImage?: string;
    posterTheme?: number;
    description?: string;
    tag: number[];
    isPublic?: boolean;
}