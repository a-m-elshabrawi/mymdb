/**
 * Hand-written to match supabase/migrations/0001_initial_schema.sql.
 * Regenerate against the live project once it exists — see SETUP.md
 * ("How to regenerate database types") — and replace this file wholesale.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media: {
        Row: {
          tmdb_id: number;
          media_type: Database["public"]["Enums"]["media_type"];
          title: string;
          original_title: string | null;
          release_date: string | null;
          year: number | null;
          poster_path: string | null;
          backdrop_path: string | null;
          overview: string | null;
          runtime: number | null;
          genres: string[];
          tmdb_rating: number | null;
          tmdb_vote_count: number | null;
          number_of_seasons: number | null;
          number_of_episodes: number | null;
          status: string | null;
          synced_at: string;
          created_at: string;
        };
        Insert: {
          tmdb_id: number;
          media_type: Database["public"]["Enums"]["media_type"];
          title: string;
          original_title?: string | null;
          release_date?: string | null;
          year?: number | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          overview?: string | null;
          runtime?: number | null;
          genres?: string[];
          tmdb_rating?: number | null;
          tmdb_vote_count?: number | null;
          number_of_seasons?: number | null;
          number_of_episodes?: number | null;
          status?: string | null;
          synced_at?: string;
          created_at?: string;
        };
        Update: {
          tmdb_id?: number;
          media_type?: Database["public"]["Enums"]["media_type"];
          title?: string;
          original_title?: string | null;
          release_date?: string | null;
          year?: number | null;
          poster_path?: string | null;
          backdrop_path?: string | null;
          overview?: string | null;
          runtime?: number | null;
          genres?: string[];
          tmdb_rating?: number | null;
          tmdb_vote_count?: number | null;
          number_of_seasons?: number | null;
          number_of_episodes?: number | null;
          status?: string | null;
          synced_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_media: {
        Row: {
          user_id: string;
          tmdb_id: number;
          media_type: Database["public"]["Enums"]["media_type"];
          status: Database["public"]["Enums"]["watch_status"];
          rating: number | null;
          liked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          tmdb_id: number;
          media_type: Database["public"]["Enums"]["media_type"];
          status?: Database["public"]["Enums"]["watch_status"];
          rating?: number | null;
          liked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          tmdb_id?: number;
          media_type?: Database["public"]["Enums"]["media_type"];
          status?: Database["public"]["Enums"]["watch_status"];
          rating?: number | null;
          liked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_media_tmdb_id_media_type_fkey";
            columns: ["tmdb_id", "media_type"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["tmdb_id", "media_type"];
          },
        ];
      };
      watch_entries: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number;
          media_type: Database["public"]["Enums"]["media_type"];
          watched_on: string;
          rating: number | null;
          review: string | null;
          is_rewatch: boolean;
          season_number: number | null;
          episode_number: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tmdb_id: number;
          media_type: Database["public"]["Enums"]["media_type"];
          watched_on?: string;
          rating?: number | null;
          review?: string | null;
          is_rewatch?: boolean;
          season_number?: number | null;
          episode_number?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tmdb_id?: number;
          media_type?: Database["public"]["Enums"]["media_type"];
          watched_on?: string;
          rating?: number | null;
          review?: string | null;
          is_rewatch?: boolean;
          season_number?: number | null;
          episode_number?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watch_entries_tmdb_id_media_type_fkey";
            columns: ["tmdb_id", "media_type"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["tmdb_id", "media_type"];
          },
        ];
      };
    };
    Views: {
      user_library: {
        Row: {
          user_id: string;
          tmdb_id: number;
          media_type: Database["public"]["Enums"]["media_type"];
          status: Database["public"]["Enums"]["watch_status"];
          user_rating: number | null;
          liked: boolean;
          added_at: string;
          updated_at: string;
          title: string;
          original_title: string | null;
          year: number | null;
          release_date: string | null;
          poster_path: string | null;
          runtime: number | null;
          genres: string[];
          tmdb_rating: number | null;
          last_watched_on: string | null;
        };
        Relationships: [];
      };
      diary_entries_view: {
        Row: {
          id: string;
          user_id: string;
          tmdb_id: number;
          media_type: Database["public"]["Enums"]["media_type"];
          watched_on: string;
          entry_rating: number | null;
          review: string | null;
          is_rewatch: boolean;
          season_number: number | null;
          episode_number: number | null;
          created_at: string;
          updated_at: string;
          title: string;
          year: number | null;
          poster_path: string | null;
          runtime: number | null;
          genres: string[];
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      media_type: "movie" | "tv";
      watch_status: "watchlist" | "watching" | "watched" | "dropped";
    };
    CompositeTypes: Record<string, never>;
  };
};
