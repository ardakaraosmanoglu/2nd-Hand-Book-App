/**
 * Mock data for development and testing
 * This file provides mock user data and book listings
 */

import { BookListing } from '../services/BookService';

// User Data

export interface MockUser {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  joinDate: string;
  rating: number; // 0-5 scale
  bio?: string;
  location?: string;
  phone?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-001',
    email: 'john.smith@example.com',
    name: 'John Smith',
    profileImage: 'https://randomuser.me/api/portraits/men/12.jpg',
    joinDate: '2023-01-15T08:30:00Z',
    rating: 4.7,
    bio: 'Avid reader and book collector. I love science fiction and philosophy books!',
    location: 'San Francisco, CA',
    phone: '(555) 123-4567'
  },
  {
    id: 'user-002',
    email: 'emily.wong@example.com',
    name: 'Emily Wong',
    profileImage: 'https://randomuser.me/api/portraits/women/23.jpg',
    joinDate: '2023-02-24T14:15:30Z',
    rating: 4.9,
    bio: 'English Literature student with a passion for classics and poetry.',
    location: 'Boston, MA',
    phone: '(555) 234-5678'
  },
  {
    id: 'user-003',
    email: 'michael.rodriguez@example.com',
    name: 'Michael Rodriguez',
    profileImage: 'https://randomuser.me/api/portraits/men/45.jpg',
    joinDate: '2023-03-10T09:45:00Z',
    rating: 4.2,
    bio: 'History teacher and collector of historical texts and biographies.',
    location: 'Chicago, IL',
    phone: '(555) 345-6789'
  },
  {
    id: 'user-004',
    email: 'sarah.johnson@example.com',
    name: 'Sarah Johnson',
    profileImage: 'https://randomuser.me/api/portraits/women/67.jpg',
    joinDate: '2023-04-05T16:20:00Z',
    rating: 4.6,
    bio: 'Medical student with a large collection of textbooks and medical references.',
    location: 'Seattle, WA',
    phone: '(555) 456-7890'
  },
  {
    id: 'user-005',
    email: 'david.kim@example.com',
    name: 'David Kim',
    profileImage: 'https://randomuser.me/api/portraits/men/89.jpg',
    joinDate: '2023-05-18T11:30:00Z',
    rating: 4.5,
    bio: 'Computer scientist and tech enthusiast with a large collection of programming books.',
    location: 'Austin, TX',
    phone: '(555) 567-8901'
  }
];

// Book Listings Data

export const mockListings: BookListing[] = [
  {
    id: 'book-001',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    price: 12.99,
    condition: 'Good',
    description: 'Classic novel set in the roaring 20s. Minor wear on cover, but pages are in good condition.',
    image_url: 'https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg',
    category: 'Fiction',
    edition: '2nd Edition',
    isbn: '9780743273565',
    publisher: 'Scribner',
    publication_year: 2004,
    is_negotiable: true,
    exchange_option: false,
    seller_id: 'user-001',
    created_at: '2023-06-15T09:30:00Z'
  },
  {
    id: 'book-002',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    price: 10.50,
    condition: 'Like New',
    description: 'Pulitzer Prize-winning novel. Book is practically new, only read once.',
    image_url: 'https://m.media-amazon.com/images/I/71FXlF2uRUL._AC_UF1000,1000_QL80_.jpg',
    category: 'Fiction',
    edition: '50th Anniversary Edition',
    isbn: '9780061120084',
    publisher: 'Harper Perennial',
    publication_year: 2006,
    is_negotiable: false,
    exchange_option: true,
    seller_id: 'user-002',
    created_at: '2023-06-18T14:45:00Z'
  },
  {
    id: 'book-003',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    price: 15.75,
    condition: 'Very Good',
    description: 'Landmark book on cosmology. Some highlighting on first few chapters, otherwise excellent condition.',
    image_url: 'https://m.media-amazon.com/images/I/A1xkFZX5k-L._AC_UF1000,1000_QL80_.jpg',
    category: 'Non-Fiction',
    edition: 'Updated Edition',
    isbn: '9780553380163',
    publisher: 'Bantam',
    publication_year: 1998,
    is_negotiable: true,
    exchange_option: false,
    seller_id: 'user-003',
    created_at: '2023-06-20T10:15:00Z'
  },
  {
    id: 'book-004',
    title: 'Gray\'s Anatomy for Students',
    author: 'Richard Drake, A. Wayne Vogl, Adam W. M. Mitchell',
    price: 45.00,
    condition: 'Good',
    description: 'Essential medical textbook. Has sticky notes and some underlining in important sections.',
    image_url: 'https://m.media-amazon.com/images/I/81sXBhe5vzL._AC_UF1000,1000_QL80_.jpg',
    category: 'Textbook',
    edition: '4th Edition',
    isbn: '9780323393041',
    publisher: 'Elsevier',
    publication_year: 2019,
    is_negotiable: true,
    exchange_option: true,
    seller_id: 'user-004',
    created_at: '2023-06-22T16:30:00Z'
  },
  {
    id: 'book-005',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    price: 28.50,
    condition: 'Very Good',
    description: 'Essential guide for programmers. Spine is intact, pages clean with minimal notes.',
    image_url: 'https://m.media-amazon.com/images/I/61KNobh6xpL._AC_UF1000,1000_QL80_.jpg',
    category: 'Computer Science',
    edition: '1st Edition',
    isbn: '9780132350884',
    publisher: 'Prentice Hall',
    publication_year: 2008,
    is_negotiable: false,
    exchange_option: false,
    seller_id: 'user-005',
    created_at: '2023-06-24T11:00:00Z'
  },
  {
    id: 'book-006',
    title: '1984',
    author: 'George Orwell',
    price: 9.99,
    condition: 'Acceptable',
    description: 'Classic dystopian novel. Some wear on cover and several dog-eared pages, but text is all readable.',
    image_url: 'https://m.media-amazon.com/images/I/71lrXHj5HzL._AC_UF1000,1000_QL80_.jpg',
    category: 'Fiction',
    edition: 'Signet Classic',
    isbn: '9780451524935',
    publisher: 'Signet Classic',
    publication_year: 1961,
    is_negotiable: true,
    exchange_option: true,
    seller_id: 'user-001',
    created_at: '2023-06-26T13:20:00Z'
  },
  {
    id: 'book-007',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    price: 8.75,
    condition: 'Good',
    description: 'Classic romance novel. Well-preserved vintage edition with beautiful cover art.',
    image_url: 'https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg',
    category: 'Fiction',
    edition: 'Vintage Classics',
    isbn: '9780679783268',
    publisher: 'Vintage',
    publication_year: 2000,
    is_negotiable: false,
    exchange_option: false,
    seller_id: 'user-002',
    created_at: '2023-06-28T09:45:00Z'
  },
  {
    id: 'book-008',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    price: 14.99,
    condition: 'Like New',
    description: 'Bestselling history of humanity. Read once, practically new condition.',
    image_url: 'https://m.media-amazon.com/images/I/71N3-2sYDRL._AC_UF1000,1000_QL80_.jpg',
    category: 'Non-Fiction',
    edition: '1st Edition',
    isbn: '9780062316097',
    publisher: 'Harper',
    publication_year: 2015,
    is_negotiable: true,
    exchange_option: false,
    seller_id: 'user-003',
    created_at: '2023-06-30T15:10:00Z'
  },
  {
    id: 'book-009',
    title: 'Principles of Neural Science',
    author: 'Eric Kandel, John D. Koester, Sarah H. Mack, Steven Siegelbaum',
    price: 75.00,
    condition: 'Very Good',
    description: 'Standard neuroscience textbook. Well-maintained with minimal highlighting.',
    image_url: 'https://m.media-amazon.com/images/I/91HULcIFgbL._AC_UF1000,1000_QL80_.jpg',
    category: 'Textbook',
    edition: '6th Edition',
    isbn: '9781259642234',
    publisher: 'McGraw Hill',
    publication_year: 2021,
    is_negotiable: true,
    exchange_option: false,
    seller_id: 'user-004',
    created_at: '2023-07-02T10:30:00Z'
  },
  {
    id: 'book-010',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    price: 32.50,
    condition: 'Good',
    description: 'The famous "Gang of Four" book. Some notes in margins but all text is readable.',
    image_url: 'https://m.media-amazon.com/images/I/51szD9HC9pL._AC_UF1000,1000_QL80_.jpg',
    category: 'Computer Science',
    edition: '1st Edition',
    isbn: '9780201633610',
    publisher: 'Addison-Wesley Professional',
    publication_year: 1994,
    is_negotiable: false,
    exchange_option: true,
    seller_id: 'user-005',
    created_at: '2023-07-05T14:00:00Z'
  },
  {
    id: 'book-011',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    price: 11.25,
    condition: 'Good',
    description: 'Classic coming-of-age novel. Some wear on cover edges but pages are clean.',
    image_url: 'https://m.media-amazon.com/images/I/91HPG31dTwL._AC_UF1000,1000_QL80_.jpg',
    category: 'Fiction',
    edition: 'First Back Bay Paperback',
    isbn: '9780316769488',
    publisher: 'Little, Brown and Company',
    publication_year: 1991,
    is_negotiable: true,
    exchange_option: false,
    seller_id: 'user-001',
    created_at: '2023-07-08T11:45:00Z'
  },
  {
    id: 'book-012',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    price: 10.00,
    condition: 'Very Good',
    description: 'International bestseller. Minimal wear, spine unbroken.',
    image_url: 'https://m.media-amazon.com/images/I/51Z0nLAfLmL._AC_UF1000,1000_QL80_.jpg',
    category: 'Fiction',
    edition: '25th Anniversary Edition',
    isbn: '9780062315007',
    publisher: 'HarperOne',
    publication_year: 2014,
    is_negotiable: false,
    exchange_option: true,
    seller_id: 'user-002',
    created_at: '2023-07-10T16:20:00Z'
  },
  {
    id: 'book-013',
    title: 'A Short History of Nearly Everything',
    author: 'Bill Bryson',
    price: 16.50,
    condition: 'Like New',
    description: 'Award-winning science book. Only read once, no marks or damage.',
    image_url: 'https://m.media-amazon.com/images/I/71r4oZgV5jL._AC_UF1000,1000_QL80_.jpg',
    category: 'Non-Fiction',
    edition: 'Illustrated Edition',
    isbn: '9780307885159',
    publisher: 'Broadway Books',
    publication_year: 2010,
    is_negotiable: true,
    exchange_option: false,
    seller_id: 'user-003',
    created_at: '2023-07-12T09:15:00Z'
  },
  {
    id: 'book-014',
    title: 'Harrison\'s Principles of Internal Medicine',
    author: 'J. Larry Jameson, Anthony S. Fauci, Dennis L. Kasper, Stephen L. Hauser, Dan L. Longo, Joseph Loscalzo',
    price: 95.00,
    condition: 'Good',
    description: 'Comprehensive medical reference. Some highlighting in first few chapters.',
    image_url: 'https://m.media-amazon.com/images/I/91KsKd3UOiL._AC_UF1000,1000_QL80_.jpg',
    category: 'Textbook',
    edition: '20th Edition',
    isbn: '9781259644030',
    publisher: 'McGraw-Hill Education',
    publication_year: 2018,
    is_negotiable: true,
    exchange_option: false,
    seller_id: 'user-004',
    created_at: '2023-07-15T14:30:00Z'
  },
  {
    id: 'book-015',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    price: 22.99,
    condition: 'Very Good',
    description: 'Classic programming book. Some dog-eared pages but otherwise in great shape.',
    image_url: 'https://m.media-amazon.com/images/I/81kqrwS1nNL._AC_UF1000,1000_QL80_.jpg',
    category: 'Computer Science',
    edition: '1st Edition',
    isbn: '9780596517748',
    publisher: "O'Reilly Media",
    publication_year: 2008,
    is_negotiable: false,
    exchange_option: true,
    seller_id: 'user-005',
    created_at: '2023-07-18T10:00:00Z'
  }
];

// Helper functions

/**
 * Get seller information by ID
 */
export function getMockSellerById(sellerId: string): MockUser | undefined {
  return mockUsers.find(user => user.id === sellerId);
}

/**
 * Get a listing by its ID
 */
export function getMockListingById(listingId: string): BookListing | undefined {
  return mockListings.find(listing => listing.id === listingId);
}

/**
 * Get all listings by a specific seller
 */
export function getMockListingsBySeller(sellerId: string): BookListing[] {
  return mockListings.filter(listing => listing.seller_id === sellerId);
} 