--
-- PostgreSQL database dump
--

\restrict WSZA3Wl4Lbzgxzh4cFni2eSjqRT2OtwW74RDSc7QfVx77Jo5F3YxCNOj2yVVr1i

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

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

--
-- Data for Name: especialidades; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.especialidades VALUES (1, 'Medicina General', NULL, true);
INSERT INTO public.especialidades VALUES (2, 'Neurologia', NULL, true);
INSERT INTO public.especialidades VALUES (3, 'Cardiologia', NULL, true);
INSERT INTO public.especialidades VALUES (4, 'Pediatria', NULL, true);
INSERT INTO public.especialidades VALUES (5, 'Dermatologia', NULL, true);
INSERT INTO public.especialidades VALUES (6, 'Traumatologia', NULL, true);
INSERT INTO public.especialidades VALUES (9, 'Oftalmologia', 'Salud visual', true);
INSERT INTO public.especialidades VALUES (7, 'Oftalmologia y Optometria', 'Salud visual', false);


--
-- Name: especialidades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.especialidades_id_seq', 9, true);


--
-- PostgreSQL database dump complete
--

\unrestrict WSZA3Wl4Lbzgxzh4cFni2eSjqRT2OtwW74RDSc7QfVx77Jo5F3YxCNOj2yVVr1i

