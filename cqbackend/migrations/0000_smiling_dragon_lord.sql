CREATE TYPE "public"."priority" AS ENUM('High', 'Normal', 'Low');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('Admin', 'Employee');--> statement-breakpoint
CREATE TABLE "email_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"email" varchar(255) NOT NULL,
	"app_password" varchar(255),
	"is_default" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" varchar(255),
	"user_id" integer,
	"email_account_id" integer,
	"thread_id" integer,
	"in_reply_to_id" integer,
	"parent_message_id" varchar(255),
	"from_email" varchar(255),
	"to" text,
	"cc" text,
	"bcc" text,
	"subject" varchar(255),
	"content" text,
	"html_content" text,
	"attachments" text,
	"email_type" varchar(20),
	"status" varchar(50),
	"folder" varchar(50),
	"is_read" boolean DEFAULT false,
	"is_starred" boolean DEFAULT false,
	"is_important" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"is_spam" boolean DEFAULT false,
	"metadata" text,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"priority" "priority",
	"forwarded" boolean DEFAULT false,
	CONSTRAINT "emails_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"firstname" varchar(255),
	"lastname" varchar(255),
	"display_name" varchar(255),
	"employee_id" varchar(255),
	"role" "role" DEFAULT 'Employee',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstname" varchar(100) NOT NULL,
	"lastname" varchar(100) NOT NULL,
	"phonenumber" varchar(20),
	"employeeid" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"alternate_email" varchar(255),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;