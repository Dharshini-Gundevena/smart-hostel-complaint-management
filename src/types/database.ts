export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Relationship<Name extends string, Columns extends string[], Target extends string, TargetColumns extends string[]> = {
  foreignKeyName: Name;
  columns: Columns;
  isOneToOne?: boolean;
  referencedRelation: Target;
  referencedColumns: TargetColumns;
};

type Table<Row, Insert, Update, Relations extends object[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relations;
};

type IdCreated = { id: string; created_at: string };
type IdOnly = { id: string };

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        IdCreated & {
          full_name: string;
          email: string | null;
          phone: string | null;
          role: Database['public']['Enums']['app_role'];
          hostel_id: string | null;
          block_id: string | null;
          room_id: string | null;
          updated_at: string;
        },
        {
          id: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          role?: Database['public']['Enums']['app_role'];
          hostel_id?: string | null;
          block_id?: string | null;
          room_id?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          role?: Database['public']['Enums']['app_role'];
          hostel_id?: string | null;
          block_id?: string | null;
          room_id?: string | null;
          updated_at?: string;
        },
        [
          Relationship<'profiles_hostel_id_fkey', ['hostel_id'], 'hostels', ['id']>,
          Relationship<'profiles_block_id_fkey', ['block_id'], 'blocks', ['id']>,
          Relationship<'profiles_room_id_fkey', ['room_id'], 'rooms', ['id']>,
          Relationship<'profiles_block_hostel_fk', ['block_id', 'hostel_id'], 'blocks', ['id', 'hostel_id']>,
          Relationship<'profiles_room_block_fk', ['room_id', 'block_id'], 'rooms', ['id', 'block_id']>,
        ]
      >;
      hostels: Table<
        IdCreated & { name: string; location: string; updated_at: string },
        { id?: string; name: string; location: string; created_at?: string; updated_at?: string },
        { name?: string; location?: string; updated_at?: string }
      >;
      blocks: Table<
        IdCreated & { hostel_id: string; name: string; updated_at: string },
        { id?: string; hostel_id: string; name: string; created_at?: string; updated_at?: string },
        { hostel_id?: string; name?: string; updated_at?: string },
        [Relationship<'blocks_hostel_id_fkey', ['hostel_id'], 'hostels', ['id']>]
      >;
      rooms: Table<
        IdCreated & {
          block_id: string;
          room_number: string;
          floor: number;
          capacity: number;
          updated_at: string;
        },
        {
          id?: string;
          block_id: string;
          room_number: string;
          floor?: number;
          capacity: number;
          created_at?: string;
          updated_at?: string;
        },
        { block_id?: string; room_number?: string; floor?: number; capacity?: number; updated_at?: string },
        [Relationship<'rooms_block_id_fkey', ['block_id'], 'blocks', ['id']>]
      >;
      complaints: Table<
        IdCreated & {
          student_id: string;
          room_id: string;
          title: string;
          description: string;
          category: string;
          subcategory: string | null;
          priority: Database['public']['Enums']['complaint_priority'];
          severity: number;
          status: Database['public']['Enums']['complaint_status'];
          image_url: string | null;
          ai_summary: string | null;
          ai_confidence: number | null;
          ai_category: string | null;
          ai_priority: Database['public']['Enums']['complaint_priority'] | null;
          ai_department: string | null;
          ai_suggested_action: string | null;
          ai_reason: string | null;
          ai_status: 'PENDING' | 'ANALYZED' | 'UNAVAILABLE';
          updated_at: string;
          due_at: string | null;
          resolved_at: string | null;
        },
        {
          id?: string;
          student_id: string;
          room_id: string;
          title: string;
          description: string;
          category: string;
          subcategory?: string | null;
          priority?: Database['public']['Enums']['complaint_priority'];
          severity?: number;
          status?: Database['public']['Enums']['complaint_status'];
          image_url?: string | null;
          ai_summary?: string | null;
          ai_confidence?: number | null;
          ai_category?: string | null;
          ai_priority?: Database['public']['Enums']['complaint_priority'] | null;
          ai_department?: string | null;
          ai_suggested_action?: string | null;
          ai_reason?: string | null;
          ai_status?: 'PENDING' | 'ANALYZED' | 'UNAVAILABLE';
          created_at?: string;
          updated_at?: string;
          due_at?: string | null;
          resolved_at?: string | null;
        },
        {
          student_id?: string;
          room_id?: string;
          title?: string;
          description?: string;
          category?: string;
          subcategory?: string | null;
          priority?: Database['public']['Enums']['complaint_priority'];
          severity?: number;
          status?: Database['public']['Enums']['complaint_status'];
          image_url?: string | null;
          ai_summary?: string | null;
          ai_confidence?: number | null;
          ai_category?: string | null;
          ai_priority?: Database['public']['Enums']['complaint_priority'] | null;
          ai_department?: string | null;
          ai_suggested_action?: string | null;
          ai_reason?: string | null;
          ai_status?: 'PENDING' | 'ANALYZED' | 'UNAVAILABLE';
          updated_at?: string;
          due_at?: string | null;
          resolved_at?: string | null;
        },
        [
          Relationship<'complaints_student_id_fkey', ['student_id'], 'profiles', ['id']>,
          Relationship<'complaints_room_id_fkey', ['room_id'], 'rooms', ['id']>,
        ]
      >;
      complaint_assignments: Table<
        IdOnly & {
          complaint_id: string;
          assigned_to: string;
          assigned_by: string;
          assigned_at: string;
          unassigned_at: string | null;
        },
        {
          id?: string;
          complaint_id: string;
          assigned_to: string;
          assigned_by: string;
          assigned_at?: string;
          unassigned_at?: string | null;
        },
        {
          complaint_id?: string;
          assigned_to?: string;
          assigned_by?: string;
          assigned_at?: string;
          unassigned_at?: string | null;
        },
        [
          Relationship<'complaint_assignments_complaint_id_fkey', ['complaint_id'], 'complaints', ['id']>,
          Relationship<'complaint_assignments_assigned_to_fkey', ['assigned_to'], 'profiles', ['id']>,
          Relationship<'complaint_assignments_assigned_by_fkey', ['assigned_by'], 'profiles', ['id']>,
        ]
      >;
      complaint_updates: Table<
        IdCreated & {
          complaint_id: string;
          updated_by: string;
          old_status: Database['public']['Enums']['complaint_status'] | null;
          new_status: Database['public']['Enums']['complaint_status'] | null;
          comment: string;
        },
        {
          id?: string;
          complaint_id: string;
          updated_by: string;
          old_status?: Database['public']['Enums']['complaint_status'] | null;
          new_status?: Database['public']['Enums']['complaint_status'] | null;
          comment: string;
          created_at?: string;
        },
        never,
        [
          Relationship<'complaint_updates_complaint_id_fkey', ['complaint_id'], 'complaints', ['id']>,
          Relationship<'complaint_updates_updated_by_fkey', ['updated_by'], 'profiles', ['id']>,
        ]
      >;
      notifications: Table<
        IdCreated & {
          user_id: string;
          complaint_id: string | null;
          title: string;
          message: string;
          type: string;
          read: boolean;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          complaint_id?: string | null;
          title: string;
          message: string;
          type: string;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        { read?: boolean; updated_at?: string },
        [
          Relationship<'notifications_user_id_fkey', ['user_id'], 'profiles', ['id']>,
          Relationship<'notifications_complaint_id_fkey', ['complaint_id'], 'complaints', ['id']>,
        ]
      >;
      feedback: Table<
        IdCreated & {
          complaint_id: string;
          student_id: string;
          rating: number;
          comment: string | null;
        },
        {
          id?: string;
          complaint_id: string;
          student_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        },
        never,
        [
          Relationship<'feedback_complaint_id_fkey', ['complaint_id'], 'complaints', ['id']>,
          Relationship<'feedback_student_id_fkey', ['student_id'], 'profiles', ['id']>,
        ]
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      current_app_role: { Args: Record<PropertyKey, never>; Returns: Database['public']['Enums']['app_role'] };
      is_assigned_maintenance: { Args: { target_complaint_id: string }; Returns: boolean };
      transition_complaint: {
        Args: {
          target_complaint_id: string;
          target_status: Database['public']['Enums']['complaint_status'];
          update_comment?: string | null;
        };
        Returns: Database['public']['Tables']['complaints']['Row'];
      };
      admin_assign_complaint: {
        Args: {
          target_complaint_id: string;
          target_maintenance_id: string;
          assignment_comment?: string | null;
        };
        Returns: Database['public']['Tables']['complaint_assignments']['Row'];
      };
      admin_update_complaint_priority: {
        Args: {
          target_complaint_id: string;
          target_priority: Database['public']['Enums']['complaint_priority'];
          update_comment?: string | null;
        };
        Returns: Database['public']['Tables']['complaints']['Row'];
      };
      store_complaint_ai_recommendation: {
        Args: { target_complaint_id: string; analysis: Json | null };
        Returns: Database['public']['Tables']['complaints']['Row'];
      };
    };
    Enums: {
      app_role: 'STUDENT' | 'ADMIN' | 'MAINTENANCE';
      complaint_status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'ESCALATED';
      complaint_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    };
    CompositeTypes: { [_ in never]: never };
  };
};