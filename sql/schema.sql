CREATE EXTENSION IF NOT EXISTS btree_gist;
--
-- PostgreSQL database dump
--

\restrict pGQOXeKJN3Q34Vg7v4f5XuE16J9hpImT5gdtKB5T99yN9CqIRLKQpCZiBEv2ZhH

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bitacora; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bitacora (
    id integer NOT NULL,
    cita_id integer,
    accion character varying(50),
    detalle text,
    fecha timestamp without time zone DEFAULT now()
);


--
-- Name: bitacora_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bitacora_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bitacora_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bitacora_id_seq OWNED BY public.bitacora.id;


--
-- Name: codigos_respaldo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.codigos_respaldo (
    id integer NOT NULL,
    usuario_id integer,
    codigo character varying(20) NOT NULL,
    usado boolean DEFAULT false,
    usado_en timestamp without time zone,
    creado_en timestamp without time zone DEFAULT now()
);


--
-- Name: codigos_respaldo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.codigos_respaldo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: codigos_respaldo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.codigos_respaldo_id_seq OWNED BY public.codigos_respaldo.id;


--
-- Name: doctores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctores (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    rol character varying(20) DEFAULT 'doctor'::character varying,
    totp_secret character varying(32) NOT NULL,
    intentos_fallidos integer DEFAULT 0,
    bloqueado_hasta timestamp without time zone
);


--
-- Name: doctores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: doctores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctores_id_seq OWNED BY public.doctores.id;


--
-- Name: especialidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.especialidades (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: especialidades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.especialidades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: especialidades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.especialidades_id_seq OWNED BY public.especialidades.id;


--
-- Name: sesiones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sesiones (
    id integer NOT NULL,
    token character varying(64) NOT NULL,
    usuario_id integer,
    rol character varying(20) NOT NULL,
    expira_en timestamp without time zone NOT NULL,
    creado_en timestamp without time zone DEFAULT now()
);


--
-- Name: sesiones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sesiones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sesiones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sesiones_id_seq OWNED BY public.sesiones.id;


--
-- Name: solicitudes_citas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes_citas (
    id integer NOT NULL,
    nombre_paciente character varying(100) NOT NULL,
    especialidad character varying(50) NOT NULL,
    urgencia character varying(20) DEFAULT 'normal'::character varying,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    fecha_solicitud timestamp without time zone DEFAULT now(),
    horario_asignado timestamp without time zone,
    especialidad_id integer,
    doctor_id integer,
    creada_por integer,
    horario_fin timestamp without time zone GENERATED ALWAYS AS ((horario_asignado + '00:30:00'::interval)) STORED,
    correo_paciente character varying(150)
);


--
-- Name: solicitudes_citas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitudes_citas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitudes_citas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitudes_citas_id_seq OWNED BY public.solicitudes_citas.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    correo character varying(150) NOT NULL,
    password_hash character varying(64) NOT NULL,
    salt character varying(32) NOT NULL,
    rol character varying(20) NOT NULL,
    totp_secret character varying(32) NOT NULL,
    intentos_fallidos integer DEFAULT 0,
    bloqueado_hasta timestamp without time zone,
    doctor_id integer,
    creado_en timestamp without time zone DEFAULT now(),
    especialidad_id integer,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT doctor_con_especialidad CHECK ((((rol)::text <> 'doctor'::text) OR (especialidad_id IS NOT NULL))),
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY ((ARRAY['doctor'::character varying, 'secretaria'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: bitacora id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bitacora ALTER COLUMN id SET DEFAULT nextval('public.bitacora_id_seq'::regclass);


--
-- Name: codigos_respaldo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigos_respaldo ALTER COLUMN id SET DEFAULT nextval('public.codigos_respaldo_id_seq'::regclass);


--
-- Name: doctores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctores ALTER COLUMN id SET DEFAULT nextval('public.doctores_id_seq'::regclass);


--
-- Name: especialidades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especialidades ALTER COLUMN id SET DEFAULT nextval('public.especialidades_id_seq'::regclass);


--
-- Name: sesiones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones ALTER COLUMN id SET DEFAULT nextval('public.sesiones_id_seq'::regclass);


--
-- Name: solicitudes_citas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_citas ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_citas_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: bitacora bitacora_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT bitacora_pkey PRIMARY KEY (id);


--
-- Name: codigos_respaldo codigos_respaldo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigos_respaldo
    ADD CONSTRAINT codigos_respaldo_pkey PRIMARY KEY (id);


--
-- Name: doctores doctores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctores
    ADD CONSTRAINT doctores_pkey PRIMARY KEY (id);


--
-- Name: especialidades especialidades_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especialidades
    ADD CONSTRAINT especialidades_nombre_key UNIQUE (nombre);


--
-- Name: especialidades especialidades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especialidades
    ADD CONSTRAINT especialidades_pkey PRIMARY KEY (id);


--
-- Name: sesiones sesiones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_pkey PRIMARY KEY (id);


--
-- Name: sesiones sesiones_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_token_key UNIQUE (token);


--
-- Name: solicitudes_citas sin_solape_doctor; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_citas
    ADD CONSTRAINT sin_solape_doctor EXCLUDE USING gist (doctor_id WITH =, tsrange(horario_asignado, (horario_asignado + '00:30:00'::interval)) WITH &&) WHERE (((doctor_id IS NOT NULL) AND (horario_asignado IS NOT NULL) AND ((estado)::text <> 'cancelada'::text)));


--
-- Name: solicitudes_citas solicitudes_citas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_citas
    ADD CONSTRAINT solicitudes_citas_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: codigos_respaldo codigos_respaldo_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.codigos_respaldo
    ADD CONSTRAINT codigos_respaldo_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: sesiones sesiones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_citas solicitudes_citas_creada_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_citas
    ADD CONSTRAINT solicitudes_citas_creada_por_fkey FOREIGN KEY (creada_por) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_citas solicitudes_citas_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_citas
    ADD CONSTRAINT solicitudes_citas_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.usuarios(id);


--
-- Name: solicitudes_citas solicitudes_citas_especialidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_citas
    ADD CONSTRAINT solicitudes_citas_especialidad_id_fkey FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id);


--
-- Name: usuarios usuarios_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctores(id);


--
-- Name: usuarios usuarios_especialidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_especialidad_id_fkey FOREIGN KEY (especialidad_id) REFERENCES public.especialidades(id);


--
-- PostgreSQL database dump complete
--

\unrestrict pGQOXeKJN3Q34Vg7v4f5XuE16J9hpImT5gdtKB5T99yN9CqIRLKQpCZiBEv2ZhH

