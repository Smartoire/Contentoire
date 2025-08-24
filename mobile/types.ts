import { ReactNode } from "react";
import { ImageStyle, TextStyle, ViewStyle } from "react-native";

// UI Component Props
export type ScreenWrapperProps = {
    style?: ViewStyle;
    children: ReactNode;
    bg?: string;
};

export type ModalWrapperProps = {
    style?: ViewStyle;
    children: ReactNode;
    bg?: string;
};

// Auth Types
export type AuthServiceType = {
    login: (email: string, password: string) => Promise<ResponseType>;
    register: (email: string, password: string, name: string) => Promise<ResponseType>;
    signInWithEmailAndPassword: (email: string, password: string) => Promise<AuthResult>;
    signOut: () => Promise<void>;
    getCurrentUser: () => User | null;
    isAuthenticated: () => boolean;
    getCurrentToken: () => string | null;
    updateUserData: (userId: string) => Promise<void>;
};

export type AuthResult = {
    user: User;
    token: string;
};

export type User = {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    profileImage?: string;
    // Add other user fields as needed from your API
};

// API Response Types
export type ResponseType = {
    success: boolean;
    data?: any;
    msg?: string;
};

// News Types
export type NewsItem = {
    id: string;
    title: string;
    summary: string;
    content: string;
    imageUrl?: string;
    url: string;
    source: string;
    publishedAt: string;
    author?: string;
    category?: string;
    readTime?: string;
};

export type NewsItemWithStatus = NewsItem & {
    status: 'draft' | 'posted' | 'deleted';
    suggestedPublishTime?: string;
    media: {
        name: string;
        logo: string; // FontAwesome6 icon name
    };
};

// Wallet Types
export type WalletType = {
    id?: string;
    name: string;
    amount?: number;
    totalIncome?: number;
    totalExpenses?: number;
    image: any;
    uid?: string;
    created?: Date;
};

// Platform Types
export type PlatformType = {
    id: string;
    name: string;
    color: string;
    icon: string; // Icon name from the icon library
};

// Component Props
export type PlatformSelectorProps = {
    selectedPlatform: string;
    onSelect: (platform: string) => void;
};

export type NewsCardProps = {
    news: NewsItemWithStatus;
    onDelete?: (id: string) => void;
    onSubmit?: (id: string) => void;
};
