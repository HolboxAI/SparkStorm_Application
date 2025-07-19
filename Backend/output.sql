--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Homebrew)
-- Dumped by pg_dump version 15.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: daxrajsinh
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    file_path character varying(500) NOT NULL,
    original_filename character varying(255) NOT NULL,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description character varying(255),
    extracted_text text,
    summary text,
    text_vector real[],
    user_id integer NOT NULL
);


ALTER TABLE public.reports OWNER TO daxrajsinh;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: daxrajsinh
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reports_id_seq OWNER TO daxrajsinh;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: daxrajsinh
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: daxrajsinh
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    name character varying(60)
);


ALTER TABLE public.user_roles OWNER TO daxrajsinh;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: daxrajsinh
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_roles_id_seq OWNER TO daxrajsinh;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: daxrajsinh
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: daxrajsinh
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(254) NOT NULL,
    username character varying(150) NOT NULL,
    hashed_password character varying(128) NOT NULL,
    first_name character varying(150),
    last_name character varying(150),
    is_active boolean DEFAULT true NOT NULL,
    organisation_name character varying(100),
    user_uuid uuid,
    is_superuser boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    role_id integer
);


ALTER TABLE public.users OWNER TO daxrajsinh;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: daxrajsinh
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO daxrajsinh;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: daxrajsinh
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: daxrajsinh
--

COPY public.reports (id, file_path, original_filename, uploaded_at, description, extracted_text, summary, text_vector, user_id) FROM stdin;
1	/path/to/uploads/1/reportA.pdf	reportA.pdf	2025-05-02 16:39:50.506302+05:30	Initial admin report	This is the extracted text for report A. It mentions patient vitals and diagnosis.	Summary of Report A.	{0.1,0.2,0.3}	1
2	/path/to/uploads/2/reportB.pdf	reportB.pdf	2025-05-02 16:39:50.506302+05:30	User 1 first report	Report B contains lab results and follow-up recommendations.	\N	{0.4,0.5,0.6}	2
3	/path/to/uploads/2/reportC.pdf	reportC.pdf	2025-05-02 16:39:50.506302+05:30	\N	Text extracted from Report C. Discusses medication side effects.	Summary of Report C.	\N	2
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: daxrajsinh
--

COPY public.user_roles (id, name) FROM stdin;
1	admin
2	user
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: daxrajsinh
--

COPY public.users (id, email, username, hashed_password, first_name, last_name, is_active, organisation_name, user_uuid, is_superuser, created_at, updated_at, role_id) FROM stdin;
2	testuser1@example.com	testuser1@example.com	$2b$12$abcdefghijklmnopqrstuvwxyz12345	Test	UserOne	t	Example Corp	b2c3d4e5-f6a7-8901-2345-67890abcdef0	f	2025-05-02 16:39:41.714097+05:30	\N	2
3	testuser2@example.com	testuser2@example.com	$2b$12$abcdefghijklmnopqrstuvwxyz12345	Another	Tester	f	Test Inc.	c3d4e5f6-a7b8-9012-3456-7890abcdef01	f	2025-05-02 16:39:41.714097+05:30	\N	2
1	admin@example.com	admin@example.com	$2b$12$hZ.HPjhUf03AsY.TRRIeo.NGq.KwIJkpVlIIWmZpGCRus2W4yUtF6	Admin	User	t	Example Corp	a1b2c3d4-e5f6-7890-1234-567890abcdef	t	2025-05-02 16:39:41.714097+05:30	\N	1
4	user@example.com	user@example.com	$2b$12$ynuMPIphsuKQNnUJ1oIIbeT6npMT8MByRehrwx1QH8wwqf2xf5PTu	string	string	t	string	39d28d1a-83b0-4bf3-9613-5c7a178d85f0	f	2025-05-02 18:04:08.79593+05:30	\N	2
\.


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: daxrajsinh
--

SELECT pg_catalog.setval('public.reports_id_seq', 3, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: daxrajsinh
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: daxrajsinh
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_user_uuid_key; Type: CONSTRAINT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_uuid_key UNIQUE (user_uuid);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_reports_user_id; Type: INDEX; Schema: public; Owner: daxrajsinh
--

CREATE INDEX idx_reports_user_id ON public.reports USING btree (user_id);


--
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: daxrajsinh
--

CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);


--
-- Name: reports reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: daxrajsinh
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.user_roles(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

